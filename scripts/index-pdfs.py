#!/usr/bin/env python3
"""
Extract and index PDF research papers for semantic search.

Creates:
- SQLite database with PDF metadata and page text
- FAISS index for semantic search
- Embeddings using sentence-transformers

Usage:
    python scripts/index-pdfs.py
"""

import os
import sys
import sqlite3
from pathlib import Path
from typing import List, Dict, Optional
import hashlib

import pdfplumber
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
PDF_DIR = PROJECT_ROOT / "research" / "pdfs"
INDEX_DIR = PROJECT_ROOT / "research" / "embeddings"
DB_PATH = INDEX_DIR / "pdfs.db"
INDEX_PATH = INDEX_DIR / "pdfs.index"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"  # Same as YouTube transcripts

# Ensure index directory exists
INDEX_DIR.mkdir(parents=True, exist_ok=True)


def get_pdf_hash(pdf_path: Path) -> str:
    """Compute SHA256 hash of PDF file for change detection."""
    sha256 = hashlib.sha256()
    with open(pdf_path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            sha256.update(chunk)
    return sha256.hexdigest()


def extract_pdf_metadata(pdf_path: Path) -> Dict:
    """Extract metadata from PDF."""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            metadata = pdf.metadata or {}
            return {
                'filename': pdf_path.name,
                'path': str(pdf_path),
                'title': metadata.get('Title', pdf_path.stem),
                'author': metadata.get('Author', ''),
                'subject': metadata.get('Subject', ''),
                'creator': metadata.get('Creator', ''),
                'producer': metadata.get('Producer', ''),
                'num_pages': len(pdf.pages),
                'file_hash': get_pdf_hash(pdf_path)
            }
    except Exception as e:
        print(f"❌ Error extracting metadata from {pdf_path.name}: {e}")
        return None


def extract_pdf_pages(pdf_path: Path) -> List[Dict]:
    """
    Extract text from each page of PDF.

    Returns:
        List of dicts with page_num and page_text
    """
    pages = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text and text.strip():  # Only include pages with text
                    pages.append({
                        'page_num': page_num,
                        'page_text': text.strip(),
                        'word_count': len(text.split())
                    })
    except Exception as e:
        print(f"❌ Error extracting pages from {pdf_path.name}: {e}")

    return pages


def initialize_database():
    """Create SQLite database with schema for PDFs and pages."""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()

    # Create pdfs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pdfs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL UNIQUE,
            path TEXT NOT NULL,
            title TEXT,
            author TEXT,
            subject TEXT,
            creator TEXT,
            producer TEXT,
            num_pages INTEGER,
            file_hash TEXT NOT NULL,
            indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create pages table (similar to chunks in transcript system)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pdf_id INTEGER NOT NULL,
            page_num INTEGER NOT NULL,
            page_text TEXT NOT NULL,
            word_count INTEGER,
            faiss_index INTEGER NOT NULL,
            FOREIGN KEY (pdf_id) REFERENCES pdfs(id),
            UNIQUE(pdf_id, page_num)
        )
    ''')

    # Create index for faster lookups
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_pages_pdf_id ON pages(pdf_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_pages_faiss_index ON pages(faiss_index)')

    conn.commit()
    return conn


def pdf_already_indexed(conn: sqlite3.Connection, pdf_path: Path) -> bool:
    """Check if PDF is already indexed with same hash."""
    cursor = conn.cursor()
    file_hash = get_pdf_hash(pdf_path)

    cursor.execute('''
        SELECT id FROM pdfs
        WHERE filename = ? AND file_hash = ?
    ''', (pdf_path.name, file_hash))

    return cursor.fetchone() is not None


def index_pdf(
    conn: sqlite3.Connection,
    pdf_path: Path,
    model: SentenceTransformer,
    embeddings_list: List[np.ndarray]
) -> int:
    """
    Index a single PDF: extract text, create embeddings, store in DB.

    Returns:
        Number of pages indexed
    """
    cursor = conn.cursor()

    # Extract metadata
    metadata = extract_pdf_metadata(pdf_path)
    if not metadata:
        return 0

    # Extract pages
    pages = extract_pdf_pages(pdf_path)
    if not pages:
        print(f"⚠️ No text extracted from {pdf_path.name}")
        return 0

    # Insert PDF metadata
    cursor.execute('''
        INSERT OR REPLACE INTO pdfs
        (filename, path, title, author, subject, creator, producer, num_pages, file_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        metadata['filename'],
        metadata['path'],
        metadata['title'],
        metadata['author'],
        metadata['subject'],
        metadata['creator'],
        metadata['producer'],
        metadata['num_pages'],
        metadata['file_hash']
    ))

    pdf_id = cursor.lastrowid

    # Process each page
    for page in pages:
        # Create embedding
        embedding = model.encode([page['page_text']], convert_to_numpy=True)
        faiss.normalize_L2(embedding)

        # Store in FAISS list (will be indexed later)
        faiss_idx = len(embeddings_list)
        embeddings_list.append(embedding[0])

        # Store page in database
        cursor.execute('''
            INSERT OR REPLACE INTO pages
            (pdf_id, page_num, page_text, word_count, faiss_index)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            pdf_id,
            page['page_num'],
            page['page_text'],
            page['word_count'],
            faiss_idx
        ))

    conn.commit()
    return len(pages)


def build_faiss_index(embeddings: List[np.ndarray]) -> faiss.Index:
    """Build FAISS index from embeddings."""
    if not embeddings:
        raise ValueError("No embeddings to index")

    # Stack embeddings into matrix
    embeddings_matrix = np.vstack(embeddings).astype('float32')

    # Create FAISS index (L2 distance, normalized vectors = cosine similarity)
    dimension = embeddings_matrix.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings_matrix)

    return index


def main():
    """Main indexing workflow."""
    print("🔍 PDF Indexing Pipeline")
    print(f"📁 PDF directory: {PDF_DIR}")
    print(f"💾 Database: {DB_PATH}")
    print(f"📊 FAISS index: {INDEX_PATH}")
    print()

    # Find all PDFs
    pdf_files = sorted(PDF_DIR.glob("*.pdf"))
    print(f"📚 Found {len(pdf_files)} PDF files")

    if not pdf_files:
        print("❌ No PDFs found in research/pdfs/")
        return

    # Initialize database
    print("🗄️ Initializing database...")
    conn = initialize_database()

    # Load embedding model
    print(f"📚 Loading embedding model: {EMBEDDING_MODEL}")
    model = SentenceTransformer(EMBEDDING_MODEL)
    print("✅ Model loaded")

    # Process each PDF
    embeddings_list = []
    total_pages = 0
    skipped = 0

    print("\n📖 Processing PDFs...")
    for pdf_path in tqdm(pdf_files, desc="Indexing PDFs"):
        # Skip if already indexed
        if pdf_already_indexed(conn, pdf_path):
            skipped += 1
            tqdm.write(f"⏭️ Skipped (already indexed): {pdf_path.name}")
            continue

        try:
            pages_indexed = index_pdf(conn, pdf_path, model, embeddings_list)
            total_pages += pages_indexed
            tqdm.write(f"✅ {pdf_path.name}: {pages_indexed} pages")
        except Exception as e:
            tqdm.write(f"❌ Error indexing {pdf_path.name}: {e}")

    print(f"\n📊 Indexed {total_pages} pages from {len(pdf_files) - skipped} PDFs")
    print(f"⏭️ Skipped {skipped} already-indexed PDFs")

    # Build FAISS index
    if embeddings_list:
        print(f"\n🔨 Building FAISS index with {len(embeddings_list)} vectors...")
        index = build_faiss_index(embeddings_list)

        # Save FAISS index
        faiss.write_index(index, str(INDEX_PATH))
        print(f"✅ Saved FAISS index to {INDEX_PATH}")
    else:
        print("⚠️ No new embeddings to index")

    # Print statistics
    cursor = conn.cursor()
    pdf_count = cursor.execute('SELECT COUNT(*) FROM pdfs').fetchone()[0]
    page_count = cursor.execute('SELECT COUNT(*) FROM pages').fetchone()[0]

    print(f"\n📈 Final Statistics:")
    print(f"   PDFs: {pdf_count}")
    print(f"   Pages: {page_count}")
    print(f"   Embeddings: {len(embeddings_list)}")

    conn.close()
    print("\n✅ Indexing complete!")


if __name__ == "__main__":
    main()

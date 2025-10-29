#!/usr/bin/env python3
"""
MCP Server for PDF Research Papers RAG
Provides semantic search and context retrieval from PDF embeddings
Uses fastMCP with stdio transport
"""

import os
import sys
import json
import sqlite3
from pathlib import Path
from typing import Optional

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

# fastMCP imports
from fastmcp import FastMCP

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
INDEX_DIR = PROJECT_ROOT / "research" / "embeddings"
DB_PATH = INDEX_DIR / "pdfs.db"
INDEX_PATH = INDEX_DIR / "pdfs.index"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Global state
model: Optional[SentenceTransformer] = None
index: Optional[faiss.Index] = None
db_conn: Optional[sqlite3.Connection] = None

# Create fastMCP server
mcp = FastMCP("Research PDF Papers")


def initialize_rag_system():
    """Initialize embedding model, FAISS index, and database connection."""
    global model, index, db_conn

    if model is None:
        print(f"📚 Loading embedding model: {EMBEDDING_MODEL}", file=sys.stderr)
        model = SentenceTransformer(EMBEDDING_MODEL)
        print("✅ Model loaded", file=sys.stderr)

    if index is None:
        if not INDEX_PATH.exists():
            raise FileNotFoundError(
                f"FAISS index not found at {INDEX_PATH}. "
                "Run scripts/index-pdfs.py first to create the index."
            )
        print(f"📊 Loading FAISS index from {INDEX_PATH}", file=sys.stderr)
        index = faiss.read_index(str(INDEX_PATH))
        print(f"✅ Loaded index with {index.ntotal} vectors", file=sys.stderr)

    if db_conn is None:
        if not DB_PATH.exists():
            raise FileNotFoundError(
                f"Database not found at {DB_PATH}. "
                "Run scripts/index-pdfs.py first to create the database."
            )
        print(f"🗄️ Connecting to database: {DB_PATH}", file=sys.stderr)
        db_conn = sqlite3.connect(str(DB_PATH))
        db_conn.row_factory = sqlite3.Row
        print("✅ Database connected", file=sys.stderr)


def search_pdfs(query: str, top_k: int = 5, author: Optional[str] = None) -> list:
    """
    Search PDFs using FAISS and return page chunks from SQLite.

    Args:
        query: Search query
        top_k: Number of results to return
        author: Optional author filter

    Returns:
        List of dicts with page text, metadata, and similarity scores
    """
    initialize_rag_system()

    # Encode query
    query_embedding = model.encode([query], convert_to_numpy=True)
    faiss.normalize_L2(query_embedding)

    # Search FAISS (get more for filtering)
    distances, indices = index.search(query_embedding, top_k * 10)

    # Get pages from database
    cursor = db_conn.cursor()
    results = []

    for idx, distance in zip(indices[0], distances[0]):
        cursor.execute('''
            SELECT
                p.page_text,
                p.page_num,
                p.word_count,
                pdf.title,
                pdf.author,
                pdf.filename,
                pdf.path,
                pdf.subject,
                pdf.num_pages
            FROM pages p
            JOIN pdfs pdf ON p.pdf_id = pdf.id
            WHERE p.faiss_index = ?
        ''', (int(idx),))

        row = cursor.fetchone()
        if row:
            # Filter by author if specified
            if author and author.lower() not in row['author'].lower():
                continue

            results.append({
                'page_text': row['page_text'],
                'similarity': float(distance),
                'title': row['title'],
                'author': row['author'],
                'filename': row['filename'],
                'path': row['path'],
                'subject': row['subject'],
                'page_num': row['page_num'],
                'num_pages': row['num_pages'],
                'word_count': row['word_count']
            })

            if len(results) >= top_k:
                break

    return results


def format_rag_context(query: str, results: list, include_paths: bool = True) -> str:
    """
    Format search results as context for an LLM.

    Args:
        query: Original query
        results: Search results from search_pdfs()
        include_paths: Whether to include file paths

    Returns:
        Formatted context string for LLM
    """
    context_parts = [
        f"# Context from Research PDF Papers",
        f"",
        f"Query: {query}",
        f"Found {len(results)} relevant pages:",
        f""
    ]

    for i, result in enumerate(results, 1):
        context_parts.append(f"## Source {i}: {result['title']}")
        context_parts.append(f"Author: {result['author']}")
        context_parts.append(f"File: {result['filename']}")

        if include_paths:
            context_parts.append(f"Path: {result['path']}")

        context_parts.append(f"Page {result['page_num'] + 1}/{result['num_pages']}")
        context_parts.append(f"Similarity: {result['similarity']:.2%}")

        if result['subject']:
            context_parts.append(f"Subject: {result['subject']}")

        context_parts.append(f"")
        context_parts.append(result['page_text'])
        context_parts.append(f"")
        context_parts.append("---")
        context_parts.append(f"")

    return "\n".join(context_parts)


def list_pdfs() -> list:
    """List all indexed PDFs with metadata."""
    initialize_rag_system()

    cursor = db_conn.cursor()
    cursor.execute('''
        SELECT
            filename,
            title,
            author,
            subject,
            num_pages,
            (SELECT COUNT(*) FROM pages WHERE pdf_id = pdfs.id) as indexed_pages
        FROM pdfs
        ORDER BY title
    ''')

    return [{
        'filename': row['filename'],
        'title': row['title'],
        'author': row['author'],
        'subject': row['subject'],
        'num_pages': row['num_pages'],
        'indexed_pages': row['indexed_pages']
    } for row in cursor.fetchall()]


def get_stats() -> dict:
    """Get index statistics."""
    initialize_rag_system()

    cursor = db_conn.cursor()

    pdf_count = cursor.execute('SELECT COUNT(*) FROM pdfs').fetchone()[0]
    page_count = cursor.execute('SELECT COUNT(*) FROM pages').fetchone()[0]

    # Get author distribution
    cursor.execute('''
        SELECT author, COUNT(*) as count
        FROM pdfs
        WHERE author != ''
        GROUP BY author
        ORDER BY count DESC
        LIMIT 10
    ''')
    top_authors = [{'author': row['author'], 'pdf_count': row['count']}
                   for row in cursor.fetchall()]

    return {
        'pdfs': pdf_count,
        'pages': page_count,
        'faiss_vectors': index.ntotal if index else 0,
        'top_authors': top_authors
    }


# Define MCP tools using fastMCP decorators
@mcp.tool()
def search_pdfs_tool(query: str, top_k: int = 5, author: Optional[str] = None) -> str:
    """
    Search research PDF papers using semantic similarity. Returns relevant pages with metadata.

    Args:
        query: Search query (e.g., 'planetary boundaries', 'AI water consumption', 'nuclear winter')
        top_k: Number of results to return (default: 5)
        author: Optional author filter (e.g., 'Richardson', 'Patterson')

    Returns:
        JSON string with search results
    """
    try:
        results = search_pdfs(query, top_k, author)
        return json.dumps(results, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def rag_query(
    query: str,
    top_k: int = 5,
    author: Optional[str] = None,
    include_paths: bool = True
) -> str:
    """
    Retrieval-Augmented Generation query. Returns formatted context from PDFs for LLM consumption.

    Args:
        query: Question or topic to find context for
        top_k: Number of context pages (default: 5)
        author: Optional author filter
        include_paths: Include file paths in context (default: true)

    Returns:
        Formatted markdown context for LLM
    """
    try:
        results = search_pdfs(query, top_k, author)
        context = format_rag_context(query, results, include_paths)
        return context
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def list_pdfs_tool() -> str:
    """
    List all indexed PDF papers with metadata.

    Returns:
        JSON string with PDF information
    """
    try:
        pdfs = list_pdfs()
        return json.dumps(pdfs, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def get_stats_tool() -> str:
    """
    Get statistics about the PDF index (papers, pages, top authors).

    Returns:
        JSON string with statistics
    """
    try:
        stats = get_stats()
        return json.dumps(stats, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


if __name__ == "__main__":
    print("🚀 Starting Research PDF Papers MCP Server (fastMCP + stdio)", file=sys.stderr)
    # Run server with stdio transport
    mcp.run(transport="stdio")

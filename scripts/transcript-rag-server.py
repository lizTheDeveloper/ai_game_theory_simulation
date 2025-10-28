#!/usr/bin/env python3
"""
MCP Server for YouTube Transcript RAG
Provides semantic search and context retrieval from transcript embeddings
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
DB_PATH = INDEX_DIR / "transcripts.db"
INDEX_PATH = INDEX_DIR / "youtube_transcripts.index"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Global state
model: Optional[SentenceTransformer] = None
index: Optional[faiss.Index] = None
db_conn: Optional[sqlite3.Connection] = None

# Create fastMCP server
mcp = FastMCP("AI Safety YouTube Transcripts")


def initialize_rag_system():
    """Initialize embedding model, FAISS index, and database connection."""
    global model, index, db_conn

    if model is None:
        print(f"📚 Loading embedding model: {EMBEDDING_MODEL}", file=sys.stderr)
        model = SentenceTransformer(EMBEDDING_MODEL)
        print("✅ Model loaded", file=sys.stderr)

    if index is None:
        print(f"📊 Loading FAISS index from {INDEX_PATH}", file=sys.stderr)
        index = faiss.read_index(str(INDEX_PATH))
        print(f"✅ Loaded index with {index.ntotal} vectors", file=sys.stderr)

    if db_conn is None:
        print(f"🗄️ Connecting to database: {DB_PATH}", file=sys.stderr)
        db_conn = sqlite3.connect(str(DB_PATH))
        db_conn.row_factory = sqlite3.Row
        print("✅ Database connected", file=sys.stderr)


def search_transcripts(query: str, top_k: int = 5, channel: Optional[str] = None) -> list:
    """
    Search transcripts using FAISS and return context chunks from SQLite.

    Args:
        query: Search query
        top_k: Number of results to return
        channel: Optional channel filter

    Returns:
        List of dicts with chunk text, metadata, and similarity scores
    """
    initialize_rag_system()

    # Encode query
    query_embedding = model.encode([query], convert_to_numpy=True)
    faiss.normalize_L2(query_embedding)

    # Search FAISS (get more for filtering)
    distances, indices = index.search(query_embedding, top_k * 10)

    # Get chunks from database
    cursor = db_conn.cursor()
    results = []

    for idx, distance in zip(indices[0], distances[0]):
        cursor.execute('''
            SELECT
                c.chunk_text,
                c.chunk_index,
                c.word_count,
                v.title,
                v.channel,
                v.url,
                v.video_id,
                (SELECT COUNT(*) FROM chunks WHERE video_id = v.id) as total_chunks
            FROM chunks c
            JOIN videos v ON c.video_id = v.id
            WHERE c.faiss_index = ?
        ''', (int(idx),))

        row = cursor.fetchone()
        if row:
            # Filter by channel if specified
            if channel and row['channel'] != channel:
                continue

            results.append({
                'chunk_text': row['chunk_text'],
                'similarity': float(distance),
                'title': row['title'],
                'channel': row['channel'],
                'url': row['url'],
                'video_id': row['video_id'],
                'chunk_index': row['chunk_index'],
                'total_chunks': row['total_chunks'],
                'word_count': row['word_count']
            })

            if len(results) >= top_k:
                break

    return results


def format_rag_context(query: str, results: list, include_urls: bool = True) -> str:
    """
    Format search results as context for an LLM.

    Args:
        query: Original query
        results: Search results from search_transcripts()
        include_urls: Whether to include video URLs

    Returns:
        Formatted context string for LLM
    """
    context_parts = [
        f"# Context from YouTube Transcripts",
        f"",
        f"Query: {query}",
        f"Found {len(results)} relevant segments:",
        f""
    ]

    for i, result in enumerate(results, 1):
        context_parts.append(f"## Source {i}: {result['title']}")
        context_parts.append(f"Channel: {result['channel']}")

        if include_urls and result['url']:
            context_parts.append(f"Video: {result['url']}")

        context_parts.append(f"Chunk {result['chunk_index'] + 1}/{result['total_chunks']}")
        context_parts.append(f"Similarity: {result['similarity']:.2%}")
        context_parts.append(f"")
        context_parts.append(result['chunk_text'])
        context_parts.append(f"")
        context_parts.append("---")
        context_parts.append(f"")

    return "\n".join(context_parts)


def list_channels() -> list:
    """List all available channels with video counts."""
    initialize_rag_system()

    cursor = db_conn.cursor()
    cursor.execute('''
        SELECT channel, COUNT(*) as video_count
        FROM videos
        GROUP BY channel
        ORDER BY channel
    ''')

    return [{'channel': row['channel'], 'video_count': row['video_count']}
            for row in cursor.fetchall()]


def get_stats() -> dict:
    """Get index statistics."""
    initialize_rag_system()

    cursor = db_conn.cursor()

    video_count = cursor.execute('SELECT COUNT(*) FROM videos').fetchone()[0]
    chunk_count = cursor.execute('SELECT COUNT(*) FROM chunks').fetchone()[0]

    return {
        'videos': video_count,
        'chunks': chunk_count,
        'faiss_vectors': index.ntotal if index else 0,
        'channels': list_channels()
    }


# Define MCP tools using fastMCP decorators
@mcp.tool()
def search_transcripts_tool(query: str, top_k: int = 5, channel: Optional[str] = None) -> str:
    """
    Search YouTube transcripts using semantic similarity. Returns relevant chunks with metadata.

    Args:
        query: Search query (e.g., 'mesa-optimization', 'deceptive alignment')
        top_k: Number of results to return (default: 5)
        channel: Optional channel filter (e.g., 'robert-miles-ai-safety')

    Returns:
        JSON string with search results
    """
    try:
        results = search_transcripts(query, top_k, channel)
        return json.dumps(results, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def rag_query(
    query: str,
    top_k: int = 5,
    channel: Optional[str] = None,
    include_urls: bool = True
) -> str:
    """
    Retrieval-Augmented Generation query. Returns formatted context from transcripts for LLM consumption.

    Args:
        query: Question or topic to find context for
        top_k: Number of context chunks (default: 5)
        channel: Optional channel filter
        include_urls: Include video URLs in context (default: true)

    Returns:
        Formatted markdown context for LLM
    """
    try:
        results = search_transcripts(query, top_k, channel)
        context = format_rag_context(query, results, include_urls)
        return context
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def list_channels_tool() -> str:
    """
    List all available YouTube channels with video counts.

    Returns:
        JSON string with channel information
    """
    try:
        channels = list_channels()
        return json.dumps(channels, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def get_stats_tool() -> str:
    """
    Get statistics about the transcript index (videos, chunks, channels).

    Returns:
        JSON string with statistics
    """
    try:
        stats = get_stats()
        return json.dumps(stats, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


if __name__ == "__main__":
    print("🚀 Starting AI Safety YouTube Transcripts MCP Server (fastMCP + stdio)", file=sys.stderr)
    # Run server with stdio transport
    mcp.run(transport="stdio")

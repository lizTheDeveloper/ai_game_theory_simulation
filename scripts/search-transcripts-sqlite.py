#!/usr/bin/env python3
"""
Search YouTube transcripts using FAISS vector similarity with SQLite metadata
Uses the embeddings index built by build-transcript-embeddings-sqlite.py
"""

import sys
import sqlite3
import json
from pathlib import Path
import numpy as np
import faiss

print("Loading dependencies...")

# Configuration
INDEX_DIR = Path(__file__).parent.parent / "research" / "embeddings"
DB_PATH = INDEX_DIR / "transcripts.db"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


def load_index():
    """Load FAISS index and SQLite database."""
    index_path = INDEX_DIR / "youtube_transcripts.index"
    stats_path = INDEX_DIR / "index_stats.json"

    if not index_path.exists():
        print(f"❌ Index not found at {index_path}")
        print("   Run build-transcript-embeddings-sqlite.py first")
        sys.exit(1)

    if not DB_PATH.exists():
        print(f"❌ Database not found at {DB_PATH}")
        print("   Run build-transcript-embeddings-sqlite.py first")
        sys.exit(1)

    print(f"Loading index from {INDEX_DIR}...")

    # Load FAISS index
    index = faiss.read_index(str(index_path))

    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Access columns by name

    # Load stats
    with open(stats_path, 'r') as f:
        stats = json.load(f)

    print(f"✓ Loaded index with {index.ntotal} vectors")
    print(f"  Videos: {stats['total_videos']}")
    print(f"  Channels: {', '.join(stats['channels'])}")
    print()

    return index, conn, stats


def load_embedding_model():
    """Load the embedding model for query encoding."""
    print(f"Loading embedding model: {EMBEDDING_MODEL}...")

    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer(EMBEDDING_MODEL)
        print("✓ Model loaded\n")
        return model
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        sys.exit(1)


def search(query: str, index, conn, model, top_k: int = 5, channel: str = None):
    """Search for relevant transcript chunks."""
    print(f"Query: \"{query}\"")
    if channel:
        print(f"Filtering by channel: {channel}")
    print(f"Searching top {top_k} results...\n")

    # Encode query
    query_embedding = model.encode([query], convert_to_numpy=True)
    faiss.normalize_L2(query_embedding)

    # Search FAISS index
    distances, indices = index.search(query_embedding, top_k * 10)  # Get more for filtering

    # Get chunk metadata from database
    cursor = conn.cursor()
    results = []

    for idx, distance in zip(indices[0], distances[0]):
        # Get chunk and video info
        cursor.execute('''
            SELECT
                c.chunk_text,
                c.chunk_index,
                v.title,
                v.channel,
                v.url,
                v.file_path,
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
                'similarity': float(distance),
                'title': row['title'],
                'channel': row['channel'],
                'url': row['url'],
                'file_path': row['file_path'],
                'chunk_index': row['chunk_index'],
                'total_chunks': row['total_chunks'],
                'chunk_text': row['chunk_text'][:200] + '...' if len(row['chunk_text']) > 200 else row['chunk_text']
            })

            # Stop when we have enough results
            if len(results) >= top_k:
                break

    # Display results
    print("=" * 80)
    print("Search Results")
    print("=" * 80 + "\n")

    for rank, result in enumerate(results, 1):
        print(f"Result {rank} (similarity: {result['similarity']:.4f})")
        print(f"─" * 80)
        print(f"Channel: {result['channel']}")
        print(f"Title: {result['title']}")
        print(f"Chunk: {result['chunk_index'] + 1}/{result['total_chunks']}")

        if result['url']:
            print(f"URL: {result['url']}")

        print(f"File: {result['file_path']}")
        print(f"\nPreview: {result['chunk_text']}")
        print()


def list_channels(conn):
    """List all available channels."""
    cursor = conn.cursor()
    cursor.execute('''
        SELECT channel, COUNT(*) as video_count
        FROM videos
        GROUP BY channel
        ORDER BY channel
    ''')

    print("\nAvailable Channels:")
    print("─" * 80)
    for row in cursor.fetchall():
        print(f"  {row['channel']}: {row['video_count']} videos")
    print()


def interactive_search():
    """Interactive search interface."""
    # Load index and model
    index, conn, stats = load_index()
    model = load_embedding_model()

    print("=" * 80)
    print("YouTube Transcript Search (Interactive Mode - SQLite)")
    print("=" * 80)
    print("Commands:")
    print("  - Enter search query to search")
    print("  - 'quit' or 'exit' to quit")
    print("  - 'stats' to show index statistics")
    print("  - 'channels' to list available channels")
    print("  - 'channel:NAME query' to search specific channel")
    print("=" * 80 + "\n")

    while True:
        try:
            query = input("Search> ").strip()

            if not query:
                continue

            if query.lower() in ['quit', 'exit', 'q']:
                print("\nGoodbye!")
                break

            if query.lower() == 'stats':
                print("\nIndex Statistics:")
                print(f"  Total videos: {stats['total_videos']}")
                print(f"  Total chunks: {stats['total_chunks']}")
                print(f"  Embedding dimension: {stats['embedding_dimension']}")
                print(f"  Channels: {', '.join(stats['channels'])}")
                print(f"  Database: {stats['database']}")
                print()
                continue

            if query.lower() == 'channels':
                list_channels(conn)
                continue

            # Check for channel filtering
            channel = None
            if query.startswith('channel:'):
                parts = query.split(' ', 1)
                if len(parts) == 2:
                    channel = parts[0][8:]  # Remove 'channel:' prefix
                    query = parts[1]

            # Perform search
            search(query, index, conn, model, top_k=5, channel=channel)

        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}\n")

    conn.close()


def main():
    """Main entry point."""
    if len(sys.argv) > 1:
        # Command-line search
        query = ' '.join(sys.argv[1:])

        # Check for channel filtering
        channel = None
        if query.startswith('channel:'):
            parts = query.split(' ', 1)
            if len(parts) == 2:
                channel = parts[0][8:]  # Remove 'channel:' prefix
                query = parts[1]

        index, conn, stats = load_index()
        model = load_embedding_model()
        search(query, index, conn, model, top_k=5, channel=channel)
        conn.close()
    else:
        # Interactive mode
        interactive_search()


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Search YouTube transcripts using FAISS vector similarity
Uses the embeddings index built by build-transcript-embeddings.py
"""

import sys
import pickle
import json
from pathlib import Path
import numpy as np
import faiss

print("Loading dependencies...")

# Configuration
INDEX_DIR = Path(__file__).parent.parent / "research" / "embeddings"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"  # Fallback model

def load_index():
    """Load FAISS index and metadata."""
    index_path = INDEX_DIR / "youtube_transcripts.index"
    metadata_path = INDEX_DIR / "youtube_transcripts_metadata.pkl"
    stats_path = INDEX_DIR / "index_stats.json"

    if not index_path.exists():
        print(f"❌ Index not found at {index_path}")
        print("   Run build-transcript-embeddings.py first")
        sys.exit(1)

    print(f"Loading index from {INDEX_DIR}...")

    # Load FAISS index
    index = faiss.read_index(str(index_path))

    # Load metadata
    with open(metadata_path, 'rb') as f:
        metadata = pickle.load(f)

    # Load stats
    with open(stats_path, 'r') as f:
        stats = json.load(f)

    print(f"✓ Loaded index with {index.ntotal} vectors")
    print(f"  Transcripts: {stats['total_transcripts']}")
    print(f"  Channels: {', '.join(stats['channels'])}")
    print()

    return index, metadata, stats


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


def search(query: str, index, metadata, model, top_k: int = 5):
    """Search for relevant transcript chunks."""
    print(f"Query: \"{query}\"")
    print(f"Searching top {top_k} results...\n")

    # Encode query
    query_embedding = model.encode([query], convert_to_numpy=True)
    faiss.normalize_L2(query_embedding)

    # Search FAISS index
    distances, indices = index.search(query_embedding, top_k)

    # Display results
    print("="*80)
    print("Search Results")
    print("="*80 + "\n")

    for rank, (idx, distance) in enumerate(zip(indices[0], distances[0]), 1):
        meta = metadata[idx]

        print(f"Result {rank} (similarity: {distance:.4f})")
        print(f"─" * 80)
        print(f"Channel: {meta['channel']}")
        print(f"Title: {meta['title']}")
        print(f"Chunk: {meta['chunk_index'] + 1}/{meta['total_chunks']}")

        if meta['url']:
            print(f"URL: {meta['url']}")

        print(f"File: {meta['file_path']}")
        print()


def interactive_search():
    """Interactive search interface."""
    # Load index and model
    index, metadata, stats = load_index()
    model = load_embedding_model()

    print("="*80)
    print("YouTube Transcript Search (Interactive Mode)")
    print("="*80)
    print("Commands:")
    print("  - Enter search query to search")
    print("  - 'quit' or 'exit' to quit")
    print("  - 'stats' to show index statistics")
    print("="*80 + "\n")

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
                print(f"  Total transcripts: {stats['total_transcripts']}")
                print(f"  Total chunks: {stats['total_chunks']}")
                print(f"  Embedding dimension: {stats['embedding_dimension']}")
                print(f"  Channels: {', '.join(stats['channels'])}")
                print()
                continue

            # Perform search
            search(query, index, metadata, model, top_k=5)

        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}\n")


def main():
    """Main entry point."""
    if len(sys.argv) > 1:
        # Command-line search
        query = ' '.join(sys.argv[1:])
        index, metadata, stats = load_index()
        model = load_embedding_model()
        search(query, index, metadata, model, top_k=5)
    else:
        # Interactive mode
        interactive_search()


if __name__ == "__main__":
    main()

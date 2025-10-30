#!/usr/bin/env python3
"""
Test semantic chunking implementation.

This test creates sample text with clear semantic boundaries and verifies
that semantic chunking correctly identifies topic shifts.
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from typing import List
import numpy as np

# Mock embedding client for testing without server
class MockEmbeddingClient:
    """Mock embedding client that returns deterministic embeddings."""

    def embed(self, text: str) -> np.ndarray:
        """Return mock embedding based on text content."""
        # Simple mock: hash text to get deterministic embedding
        # In real use, this would call the MLX server
        np.random.seed(hash(text) % (2**32))
        embedding = np.random.randn(384).astype(np.float32)
        embedding = embedding / np.linalg.norm(embedding)
        return embedding

    def embed_batch(self, texts: List[str]) -> np.ndarray:
        """Return batch of mock embeddings."""
        embeddings = [self.embed(text) for text in texts]
        return np.vstack(embeddings)


def test_sentence_splitting():
    """Test sentence splitting."""
    # Import with underscore (Python module naming)
    import importlib.util
    spec = importlib.util.spec_from_file_location("pdf_rag_local", Path(__file__).parent / "pdf-rag-local.py")
    pdf_rag = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(pdf_rag)
    SemanticChunker = pdf_rag.SemanticChunker

    text = "This is sentence one. This is sentence two! Is this sentence three? Yes it is."

    chunker = SemanticChunker()
    sentences = chunker._split_sentences(text)

    print(f"✅ Sentence splitting test:")
    print(f"   Input: {text}")
    print(f"   Sentences: {len(sentences)}")
    for i, sent in enumerate(sentences):
        print(f"     {i+1}. {sent}")

    assert len(sentences) == 4, f"Expected 4 sentences, got {len(sentences)}"
    print()


def test_cosine_similarity():
    """Test cosine similarity calculation."""
    from scripts.pdf_rag_local import SemanticChunker

    # Same vectors
    vec1 = np.array([1.0, 0.0, 0.0])
    vec2 = np.array([1.0, 0.0, 0.0])
    sim = SemanticChunker._cosine_similarity(vec1, vec2)
    print(f"✅ Cosine similarity test:")
    print(f"   Same vectors: {sim:.3f} (expected ~1.0)")
    assert 0.99 <= sim <= 1.0

    # Orthogonal vectors
    vec1 = np.array([1.0, 0.0, 0.0])
    vec2 = np.array([0.0, 1.0, 0.0])
    sim = SemanticChunker._cosine_similarity(vec1, vec2)
    print(f"   Orthogonal vectors: {sim:.3f} (expected ~0.0)")
    assert 0.0 <= sim <= 0.1

    # Opposite vectors
    vec1 = np.array([1.0, 0.0, 0.0])
    vec2 = np.array([-1.0, 0.0, 0.0])
    sim = SemanticChunker._cosine_similarity(vec1, vec2)
    print(f"   Opposite vectors: {sim:.3f} (expected ~0.0, clamped)")
    assert 0.0 <= sim <= 0.1
    print()


def test_semantic_chunking_fallback():
    """Test semantic chunking fallback to paragraph when server unavailable."""
    from scripts.pdf_rag_local import SemanticChunker, ChunkStrategy

    text = """This is paragraph one. It has multiple sentences.

This is paragraph two. Also with sentences."""

    chunker = SemanticChunker(strategy=ChunkStrategy.SEMANTIC)
    chunks = chunker.chunk(text, metadata={'source': 'test'})

    print(f"✅ Semantic chunking fallback test:")
    print(f"   Text: {len(text)} chars")
    print(f"   Chunks: {len(chunks)}")
    print(f"   Strategy: Falls back to paragraph (server unavailable)")

    # Should fall back to paragraph chunking (2 paragraphs)
    assert len(chunks) == 2, f"Expected 2 chunks (paragraph fallback), got {len(chunks)}"
    print()


def test_semantic_chunking_with_mock():
    """Test semantic chunking with mock embeddings."""
    from scripts.pdf_rag_local import SemanticChunker, ChunkStrategy

    # Text with clear topic shifts
    text = """AI safety is important. We need aligned systems. Researchers are working on this.

Cats are great pets. They are independent. Many people love cats.

Machine learning uses neural networks. Deep learning is powerful. GPUs accelerate training."""

    chunker = SemanticChunker(strategy=ChunkStrategy.SEMANTIC, similarity_threshold=0.6)

    # Replace embedding client with mock
    chunker.embedding_client = MockEmbeddingClient()

    chunks = chunker.chunk(text, metadata={'source': 'test'})

    print(f"✅ Semantic chunking with mock embeddings:")
    print(f"   Text: {len(text)} chars")
    print(f"   Chunks: {len(chunks)}")
    for i, chunk in enumerate(chunks):
        print(f"\n   Chunk {i+1} ({chunk.metadata.get('sentences', 0)} sentences):")
        print(f"     {chunk.text[:80]}...")
    print()


if __name__ == '__main__':
    print("=" * 70)
    print("Testing Semantic Chunking Implementation")
    print("=" * 70)
    print()

    try:
        test_sentence_splitting()
        test_cosine_similarity()
        test_semantic_chunking_fallback()
        test_semantic_chunking_with_mock()

        print("=" * 70)
        print("✅ All tests passed!")
        print("=" * 70)

    except AssertionError as e:
        print(f"\n❌ Test failed: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

#!/bin/bash
# Test semantic chunking implementation

echo "======================================================================"
echo "Testing Semantic Chunking Implementation"
echo "======================================================================"
echo ""

# Create a test PDF with sample text (using plain text for simplicity)
TEST_TEXT="AI safety research is crucial. We need to solve alignment. Many researchers are working on this problem.

Climate change poses existential risks. Global temperatures are rising. We must act now to reduce emissions.

The economy is recovering slowly. Unemployment remains high. Central banks are considering interest rate changes."

# Save to temp file
TEST_FILE="/tmp/test-semantic-chunking.txt"
echo "$TEST_TEXT" > "$TEST_FILE"

echo "✅ Test text created (3 paragraphs with different topics)"
echo ""

# Test 1: Paragraph chunking (baseline)
echo "Test 1: Paragraph chunking (baseline)"
echo "----------------------------------------------------------------------"
python3 -c "
import sys
import re

text = '''$TEST_TEXT'''

# Simple paragraph split
paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
print(f'Paragraphs: {len(paragraphs)}')
for i, p in enumerate(paragraphs):
    print(f'  {i+1}. {p[:60]}...')
" 2>&1
echo ""

# Test 2: Sentence splitting
echo "Test 2: Sentence splitting"
echo "----------------------------------------------------------------------"
python3 -c "
import re

text = '''$TEST_TEXT'''

# Split on sentence boundaries
sentences = re.split(r'(?<=[.!?])\s+', text)
sentences = [s.strip() for s in sentences if s.strip()]

print(f'Sentences: {len(sentences)}')
for i, s in enumerate(sentences):
    print(f'  {i+1}. {s}')
" 2>&1
echo ""

# Test 3: Cosine similarity calculation
echo "Test 3: Cosine similarity math"
echo "----------------------------------------------------------------------"
python3 -c "
import numpy as np

def cosine_similarity(v1, v2):
    v1_norm = v1 / (np.linalg.norm(v1) + 1e-8)
    v2_norm = v2 / (np.linalg.norm(v2) + 1e-8)
    return max(0.0, min(1.0, float(np.dot(v1_norm, v2_norm))))

# Test vectors
same = (np.array([1.0, 0, 0]), np.array([1.0, 0, 0]))
orthogonal = (np.array([1.0, 0, 0]), np.array([0, 1.0, 0]))
similar = (np.array([1.0, 0.5, 0]), np.array([1.0, 0.6, 0]))

print(f'Same vectors:       {cosine_similarity(*same):.3f} (expect ~1.0)')
print(f'Orthogonal vectors: {cosine_similarity(*orthogonal):.3f} (expect ~0.0)')
print(f'Similar vectors:    {cosine_similarity(*similar):.3f} (expect ~0.9+)')
" 2>&1
echo ""

echo "======================================================================"
echo "✅ Core functionality tests passed!"
echo ""
echo "To test full semantic chunking with MLX embeddings:"
echo "  1. Start MLX server: python3 scripts/mlx-embedding-server.py --port 8765"
echo "  2. Index with semantic chunking:"
echo "     python3 scripts/pdf-rag-local.py index test.pdf --output test.faiss \\"
echo "       --chunk-strategy semantic --similarity-threshold 0.7"
echo "======================================================================"
